import { Actor, HttpAgent } from "@dfinity/agent";
import {
  idlFactory as todo_idl,
  canisterId as todo_canister_id,
} from "dfx-generated/simple_to_do";

const agent = new HttpAgent();
export const todo_actor = Actor.createActor(todo_idl, {
  agent,
  canisterId: todo_canister_id,
});
