import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";
import { registerCaller } from "./test-utils";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");
const carol = createIdentity("carol");

function actorFor(identity: ReturnType<typeof createIdentity>): Actor<_SERVICE> {
  const actor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  actor.setIdentity(identity);
  return actor;
}

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  });
  canisterId = installed.canisterId;
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  const aliceActor = await registerCaller(actorFor(alice), alice);
  await expect(aliceActor.getMyProfile()).resolves.toEqual([]);
  await expect(aliceActor.listConversations()).resolves.toEqual([]);
});

it("round-trips a profile through the real canister", async () => {
  const aliceActor = await registerCaller(actorFor(alice), alice);
  const saved = await aliceActor.saveMyProfile({
    displayName: "Alice",
    photo: [],
  });
  expect(saved.displayName).toBe("Alice");

  const mine = await aliceActor.getMyProfile();
  expect(mine).toHaveLength(1);
  expect(mine[0]).toMatchObject({ displayName: "Alice" });
});

it("finds a registered user by display name", async () => {
  const bobActor = await registerCaller(actorFor(bob), bob);
  await bobActor.saveMyProfile({ displayName: "Bob Builder", photo: [] });

  const aliceActor = await registerCaller(actorFor(alice), alice);
  const results = await aliceActor.searchProfiles("bob");
  expect(results).toHaveLength(1);
  expect(results[0]).toMatchObject({ displayName: "Bob Builder" });
});

it("round-trips a message through the real canister", async () => {
  const aliceActor = await registerCaller(actorFor(alice), alice);
  const bobActor = await registerCaller(actorFor(bob), bob);

  const conversationId = await aliceActor.openConversation(bob.getPrincipal());
  const sent = await aliceActor.sendMessage(conversationId, "hello bob");
  expect(sent.body).toBe("hello bob");

  const history = await bobActor.getMessages(conversationId);
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({ body: "hello bob" });
  expect(history[0].sender.toText()).toBe(alice.getPrincipal().toText());
});

it("reuses an existing conversation between the same two users", async () => {
  const aliceActor = await registerCaller(actorFor(alice), alice);
  const first = await aliceActor.openConversation(bob.getPrincipal());
  const second = await aliceActor.openConversation(bob.getPrincipal());
  expect(second).toBe(first);
});

it("clears the unread count after markRead", async () => {
  const aliceActor = await registerCaller(actorFor(alice), alice);
  const bobActor = await registerCaller(actorFor(bob), bob);

  const conversationId = await aliceActor.openConversation(bob.getPrincipal());
  await aliceActor.sendMessage(conversationId, "unread for bob");

  const before = await bobActor.listConversations();
  const bobConversation = before.find((c) => c.id === conversationId);
  expect(bobConversation?.unreadCount).toBeGreaterThan(0n);

  await bobActor.markRead(conversationId);

  const after = await bobActor.listConversations();
  const cleared = after.find((c) => c.id === conversationId);
  expect(cleared?.unreadCount).toBe(0n);
});

it("does not let a non-participant read or send in a conversation", async () => {
  const aliceActor = await registerCaller(actorFor(alice), alice);
  const carolActor = await registerCaller(actorFor(carol), carol);

  const conversationId = await aliceActor.openConversation(bob.getPrincipal());

  await expect(carolActor.getMessages(conversationId)).rejects.toThrow();
  await expect(
    carolActor.sendMessage(conversationId, "intruder"),
  ).rejects.toThrow();
});

it("rejects an anonymous caller from writing", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.saveMyProfile({ displayName: "Anon", photo: [] }),
  ).rejects.toThrow();
  await expect(guest.openConversation(bob.getPrincipal())).rejects.toThrow();
});
