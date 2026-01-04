import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type { ChecklistItem, Home, Invitation, Palette, Room, Share } from "../types";
import { createShareId } from "../utils/share";
import { defaultPalette } from "../constants/palettes";

const homesCollection = collection(db, "homes");
const roomsCollection = collection(db, "rooms");
const itemsCollection = collection(db, "items");
const sharesCollection = collection(db, "shares");
const usersCollection = collection(db, "users");
const invitationsCollection = collection(db, "invitations");

const seedRooms = [
  {
    name: "Cozinha",
    items: [
      { name: "Liquidificador", necessityLevel: "high" as const },
      { name: "Panela", necessityLevel: "high" as const },
      { name: "Jogo de pratos", necessityLevel: "medium" as const },
    ],
  },
  {
    name: "Quarto",
    items: [
      { name: "Cama", necessityLevel: "high" as const },
      { name: "Travesseiros", necessityLevel: "medium" as const },
      { name: "Abajur", necessityLevel: "low" as const },
    ],
  },
];

export const upsertUserProfile = async (user: User) => {
  const userRef = doc(usersCollection, user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email ?? null,
      emailLower: user.email?.toLowerCase() ?? null,
      displayName: user.displayName ?? "Usuario",
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const fetchHomesForUser = async (uid: string) => {
  const ownerQuery = query(homesCollection, where("ownerId", "==", uid));
  const memberQuery = query(homesCollection, where("members", "array-contains", uid));
  const [ownerSnap, memberSnap] = await Promise.all([
    getDocs(ownerQuery),
    getDocs(memberQuery),
  ]);
  const homesMap = new Map<string, Home>();
  ownerSnap.forEach((docSnap) => {
    homesMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() as Omit<Home, "id">) });
  });
  memberSnap.forEach((docSnap) => {
    homesMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() as Omit<Home, "id">) });
  });
  return Array.from(homesMap.values());
};

export const createHome = async ({
  ownerId,
  name,
  palette,
  withSeeds,
}: {
  ownerId: string;
  name: string;
  palette?: Palette;
  withSeeds?: boolean;
}) => {
  const homeRef = doc(homesCollection);
  const batch = writeBatch(db);
  batch.set(homeRef, {
    ownerId,
    name,
    members: [],
    pendingInvites: [],
    palette: palette ?? defaultPalette,
    createdAt: serverTimestamp(),
  });

  if (withSeeds) {
    seedRooms.forEach((room, index) => {
      const roomRef = doc(roomsCollection);
      batch.set(roomRef, {
        homeId: homeRef.id,
        name: room.name,
        order: index,
        createdAt: serverTimestamp(),
      });
      room.items.forEach((item) => {
        const itemRef = doc(itemsCollection);
        batch.set(itemRef, {
          homeId: homeRef.id,
          roomId: roomRef.id,
          name: item.name,
          necessityLevel: item.necessityLevel,
          done: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    });
  }

  await batch.commit();
  return homeRef.id;
};

export const fetchRooms = async (homeId: string) => {
  const roomsQuery = query(roomsCollection, where("homeId", "==", homeId));
  const snap = await getDocs(roomsQuery);
  const rooms = snap.docs.map(
    (docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) }) as Room
  );
  rooms.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return rooms;
};

export const fetchItems = async (homeId: string) => {
  const itemsQuery = query(itemsCollection, where("homeId", "==", homeId));
  const snap = await getDocs(itemsQuery);
  return snap.docs.map(
    (docSnap) =>
      ({ id: docSnap.id, ...(docSnap.data() as Omit<ChecklistItem, "id">) }) as ChecklistItem
  );
};

export const createRoom = async ({
  homeId,
  name,
  order,
}: {
  homeId: string;
  name: string;
  order: number;
}) => {
  const roomRef = await addDoc(roomsCollection, {
    homeId,
    name,
    order,
    createdAt: serverTimestamp(),
  });
  return roomRef.id;
};

export const updateRoom = async (roomId: string, data: Partial<Room>) => {
  await updateDoc(doc(roomsCollection, roomId), data);
};

export const reorderRooms = async (rooms: Room[]) => {
  const batch = writeBatch(db);
  rooms.forEach((room, index) => {
    batch.update(doc(roomsCollection, room.id), { order: index });
  });
  await batch.commit();
};

export const deleteRoom = async (roomId: string) => {
  const batch = writeBatch(db);
  const itemsQuery = query(itemsCollection, where("roomId", "==", roomId));
  const itemsSnap = await getDocs(itemsQuery);
  itemsSnap.forEach((itemDoc) => batch.delete(itemDoc.ref));
  batch.delete(doc(roomsCollection, roomId));
  await batch.commit();
};

export const createItem = async ({
  homeId,
  roomId,
  name,
  necessityLevel,
}: {
  homeId: string;
  roomId: string;
  name: string;
  necessityLevel: ChecklistItem["necessityLevel"];
}) => {
  const itemRef = await addDoc(itemsCollection, {
    homeId,
    roomId,
    name,
    necessityLevel,
    done: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return itemRef.id;
};

export const updateItem = async (itemId: string, data: Partial<ChecklistItem>) => {
  await updateDoc(doc(itemsCollection, itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteItem = async (itemId: string) => {
  await deleteDoc(doc(itemsCollection, itemId));
};

export const updatePalette = async (homeId: string, palette: Palette) => {
  await updateDoc(doc(homesCollection, homeId), { palette });
};

export const inviteMember = async ({
  homeId,
  homeName,
  email,
  createdBy,
}: {
  homeId: string;
  homeName: string;
  email: string;
  createdBy: string;
}) => {
  const emailLower = email.trim().toLowerCase();
  if (!emailLower) return;
  const existingQuery = query(
    invitationsCollection,
    where("homeId", "==", homeId),
    where("emailLower", "==", emailLower),
    where("status", "==", "pending")
  );
  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) return;

  await addDoc(invitationsCollection, {
    homeId,
    homeName,
    createdBy,
    email: email.trim(),
    emailLower,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(homesCollection, homeId), {
    pendingInvites: arrayUnion(emailLower),
  });
};

export const fetchInvitationsForHome = async (homeId: string) => {
  const invitesQuery = query(invitationsCollection, where("homeId", "==", homeId));
  const snap = await getDocs(invitesQuery);
  const invites = snap.docs.map(
    (docSnap) =>
      ({ id: docSnap.id, ...(docSnap.data() as Omit<Invitation, "id">) }) as Invitation
  );
  invites.sort((a, b) => {
    const aTime = (a.createdAt as { seconds?: number })?.seconds ?? 0;
    const bTime = (b.createdAt as { seconds?: number })?.seconds ?? 0;
    return bTime - aTime;
  });
  return invites;
};

export const fetchInvitationsForEmail = async (emailLower: string) => {
  const invitesQuery = query(
    invitationsCollection,
    where("emailLower", "==", emailLower)
  );
  const snap = await getDocs(invitesQuery);
  const invites = snap.docs.map(
    (docSnap) =>
      ({ id: docSnap.id, ...(docSnap.data() as Omit<Invitation, "id">) }) as Invitation
  );
  invites.sort((a, b) => {
    const aTime = (a.createdAt as { seconds?: number })?.seconds ?? 0;
    const bTime = (b.createdAt as { seconds?: number })?.seconds ?? 0;
    return bTime - aTime;
  });
  return invites;
};

export const acceptInvitation = async (invite: Invitation, userId: string) => {
  const batch = writeBatch(db);
  batch.update(doc(homesCollection, invite.homeId), {
    members: arrayUnion(userId),
    pendingInvites: arrayRemove(invite.emailLower),
  });
  batch.update(doc(invitationsCollection, invite.id), {
    status: "accepted",
    inviteeUid: userId,
    respondedAt: serverTimestamp(),
  });
  await batch.commit();
};

export const declineInvitation = async (inviteId: string) => {
  const inviteRef = doc(invitationsCollection, inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) return;
  const invite = inviteSnap.data() as Invitation;
  const batch = writeBatch(db);
  batch.update(inviteRef, {
    status: "denied",
    respondedAt: serverTimestamp(),
  });
  batch.update(doc(homesCollection, invite.homeId), {
    pendingInvites: arrayRemove(invite.emailLower),
  });
  await batch.commit();
};

export const syncInvitationsForUser = async (user: User) => {
  const emailLower = user.email?.toLowerCase();
  if (!emailLower) return;
  const invitesQuery = query(
    invitationsCollection,
    where("emailLower", "==", emailLower),
    where("status", "==", "pending")
  );
  const snap = await getDocs(invitesQuery);
  if (snap.empty) return;
  const batch = writeBatch(db);
  for (const docSnap of snap.docs) {
    const invite = docSnap.data() as Invitation;
    const homeSnap = await getDoc(doc(homesCollection, invite.homeId));
    if (!homeSnap.exists()) continue;
    const home = homeSnap.data() as Home;
    const isMember = (home.members ?? []).includes(user.uid);
    if (!isMember) continue;
    batch.update(docSnap.ref, {
      status: "accepted",
      inviteeUid: user.uid,
      respondedAt: serverTimestamp(),
    });
    batch.update(doc(homesCollection, invite.homeId), {
      pendingInvites: arrayRemove(invite.emailLower),
    });
  }
  await batch.commit();
};

export const createShare = async ({
  homeId,
  createdBy,
  rooms,
  items,
}: {
  homeId: string;
  createdBy: string;
  rooms: Room[];
  items: ChecklistItem[];
}) => {
  const shareId = createShareId();
  const shareRef = doc(sharesCollection, shareId);
  const batch = writeBatch(db);
  const sharePayload: Share = {
    id: shareId,
    homeId,
    createdBy,
    mode: "readonly",
    roomsIncluded: rooms.map((room) => room.id),
    createdAt: serverTimestamp(),
  };
  batch.set(shareRef, sharePayload);

  rooms.forEach((room) => {
    const roomRef = doc(collection(shareRef, "rooms"), room.id);
    batch.set(roomRef, {
      name: room.name,
      order: room.order,
    });
  });

  items.forEach((item) => {
    const itemRef = doc(collection(shareRef, "items"), item.id);
    batch.set(itemRef, {
      name: item.name,
      roomId: item.roomId,
      necessityLevel: item.necessityLevel,
      done: item.done,
    });
  });

  await batch.commit();
  return shareId;
};

export const fetchShare = async (shareId: string) => {
  const shareRef = doc(sharesCollection, shareId);
  const shareSnap = await getDoc(shareRef);
  if (!shareSnap.exists()) return null;
  return { id: shareSnap.id, ...(shareSnap.data() as Omit<Share, "id">) } as Share;
};

export const fetchShareRooms = async (shareId: string) => {
  const shareRef = doc(sharesCollection, shareId);
  const roomsSnap = await getDocs(query(collection(shareRef, "rooms"), orderBy("order", "asc")));
  return roomsSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Room, "id">),
  })) as Room[];
};

export const fetchShareItems = async (shareId: string) => {
  const shareRef = doc(sharesCollection, shareId);
  const itemsSnap = await getDocs(collection(shareRef, "items"));
  return itemsSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ChecklistItem, "id">),
  })) as ChecklistItem[];
};
