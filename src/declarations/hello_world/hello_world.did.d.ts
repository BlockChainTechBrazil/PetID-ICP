import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Error = { 'InvalidInput' : string } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'AlreadyExists' : null };
export interface Pet {
  'id' : bigint,
  'age' : [] | [bigint],
  'owner' : string,
  'name' : string,
  'breed' : [] | [string],
  'registered_at' : bigint,
  'species' : string,
}
export type Result = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_1 = { 'ok' : Pet } |
  { 'err' : Error };
export interface _SERVICE {
  'getCounter' : ActorMethod<[], bigint>,
  'getName' : ActorMethod<[], string>,
  'getPet' : ActorMethod<[bigint], Result_1>,
  'getStats' : ActorMethod<
    [],
    { 'totalPets' : bigint, 'nextId' : bigint, 'counterValue' : bigint }
  >,
  'getTotalPets' : ActorMethod<[], bigint>,
  'greet' : ActorMethod<[string], string>,
  'hello' : ActorMethod<[], string>,
  'increment' : ActorMethod<[], bigint>,
  'listPets' : ActorMethod<[], Array<Pet>>,
  'registerPet' : ActorMethod<[Pet], Result>,
  'reset' : ActorMethod<[], bigint>,
  'searchPetsByOwner' : ActorMethod<[string], Array<Pet>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
