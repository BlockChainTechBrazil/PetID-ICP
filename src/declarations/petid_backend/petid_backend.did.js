export const idlFactory = ({ IDL }) => {
  const PetId = IDL.Nat;
  const Pet = IDL.Record({
    'id' : PetId,
    'birthDate' : IDL.Int,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'breed' : IDL.Text,
    'registrationDate' : IDL.Int,
    'isRegistered' : IDL.Bool,
    'ipfsHash' : IDL.Text,
    'species' : IDL.Text,
  });
  const PetRegistration = IDL.Record({
    'birthDate' : IDL.Int,
    'name' : IDL.Text,
    'breed' : IDL.Text,
    'ipfsHash' : IDL.Text,
    'species' : IDL.Text,
  });
  const RegistrationResult = IDL.Variant({ 'ok' : PetId, 'err' : IDL.Text });
  const TransferResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const UpdateResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'getAllPets' : IDL.Func([], [IDL.Vec(Pet)], ['query']),
    'getCaller' : IDL.Func([], [IDL.Principal], []),
    'getContractInfo' : IDL.Func(
        [],
        [IDL.Record({ 'totalPets' : IDL.Nat, 'nextPetId' : IDL.Nat })],
        ['query'],
      ),
    'getOwnerPets' : IDL.Func([IDL.Principal], [IDL.Vec(Pet)], ['query']),
    'getPet' : IDL.Func([PetId], [IDL.Opt(Pet)], ['query']),
    'isPetOwner' : IDL.Func([PetId, IDL.Principal], [IDL.Bool], ['query']),
    'registerPet' : IDL.Func([PetRegistration], [RegistrationResult], []),
    'transferPet' : IDL.Func([PetId, IDL.Principal], [TransferResult], []),
    'updatePetData' : IDL.Func([PetId, IDL.Text], [UpdateResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
