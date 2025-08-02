export const idlFactory = ({ IDL }) => {
  const Pet = IDL.Record({
    'id': IDL.Nat,
    'birthDate': IDL.Int,
    'name': IDL.Text,
    'owner': IDL.Principal,
    'ipfsHash': IDL.Text,
    'isRegistered': IDL.Bool,
    'registrationDate': IDL.Int,
    'species': IDL.Text,
    'breed': IDL.Text,
  });
  const PetRegistration = IDL.Record({
    'birthDate': IDL.Int,
    'name': IDL.Text,
    'ipfsHash': IDL.Text,
    'species': IDL.Text,
    'breed': IDL.Text,
  });
  const RegistrationResult = IDL.Variant({ 'ok': IDL.Nat, 'err': IDL.Text });
  const TransferResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
  const UpdateResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
  return IDL.Service({
    'getAllPets': IDL.Func([], [IDL.Vec(Pet)], ['query']),
    'getCaller': IDL.Func([], [IDL.Principal], []),
    'getContractInfo': IDL.Func(
      [],
      [IDL.Record({ 'totalPets': IDL.Nat, 'nextPetId': IDL.Nat })],
      ['query'],
    ),
    'getOwnerPets': IDL.Func([IDL.Principal], [IDL.Vec(Pet)], ['query']),
    'getPet': IDL.Func([IDL.Nat], [IDL.Opt(Pet)], ['query']),
    'isPetOwner': IDL.Func([IDL.Nat, IDL.Principal], [IDL.Bool], ['query']),
    'registerPet': IDL.Func([PetRegistration], [RegistrationResult], []),
    'transferPet': IDL.Func([IDL.Nat, IDL.Principal], [TransferResult], []),
    'updatePetData': IDL.Func([IDL.Nat, IDL.Text], [UpdateResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
