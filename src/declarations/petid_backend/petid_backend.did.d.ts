import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Pet {
  'id': bigint,
  'birthDate': bigint,
  'name': string,
  'owner': Principal,
  'ipfsHash': string,
  'isRegistered': boolean,
  'registrationDate': bigint,
  'species': string,
  'breed': string,
}
export interface PetRegistration {
  'birthDate': bigint,
  'name': string,
  'ipfsHash': string,
  'species': string,
  'breed': string,
}
export type RegistrationResult = { 'ok': bigint } | { 'err': string };
export type TransferResult = { 'ok': string } | { 'err': string };
export type UpdateResult = { 'ok': string } | { 'err': string };

export interface _SERVICE {
  'getAllPets': ActorMethod<[], Array<Pet>>,
  'getCaller': ActorMethod<[], Principal>,
  'getContractInfo': ActorMethod<[], { 'totalPets': bigint, 'nextPetId': bigint }>,
  'getOwnerPets': ActorMethod<[Principal], Array<Pet>>,
  'getPet': ActorMethod<[bigint], [] | [Pet]>,
  'isPetOwner': ActorMethod<[bigint, Principal], boolean>,
  'registerPet': ActorMethod<[PetRegistration], RegistrationResult>,
  'transferPet': ActorMethod<[bigint, Principal], TransferResult>,
  'updatePetData': ActorMethod<[bigint, string], UpdateResult>,
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];
