import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Pet {
  'id' : PetId,
  'birthDate' : bigint,
  'owner' : Principal,
  'name' : string,
  'breed' : string,
  'registrationDate' : bigint,
  'isRegistered' : boolean,
  'ipfsHash' : string,
  'species' : string,
}
export type PetId = bigint;
export interface PetRegistration {
  'birthDate' : bigint,
  'name' : string,
  'breed' : string,
  'ipfsHash' : string,
  'species' : string,
}
export type RegistrationResult = { 'ok' : PetId } |
  { 'err' : string };
export type TransferResult = { 'ok' : string } |
  { 'err' : string };
export type UpdateResult = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'getAllPets' : ActorMethod<[], Array<Pet>>,
  'getCaller' : ActorMethod<[], Principal>,
  'getContractInfo' : ActorMethod<
    [],
    { 'totalPets' : bigint, 'nextPetId' : bigint }
  >,
  'getOwnerPets' : ActorMethod<[Principal], Array<Pet>>,
  'getPet' : ActorMethod<[PetId], [] | [Pet]>,
  'isPetOwner' : ActorMethod<[PetId, Principal], boolean>,
  'registerPet' : ActorMethod<[PetRegistration], RegistrationResult>,
  'transferPet' : ActorMethod<[PetId, Principal], TransferResult>,
  'updatePetData' : ActorMethod<[PetId, string], UpdateResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
