export const idlFactory = ({ IDL }) => {
  const Pet = IDL.Record({
    'id' : IDL.Nat,
    'age' : IDL.Opt(IDL.Nat),
    'owner' : IDL.Text,
    'name' : IDL.Text,
    'breed' : IDL.Opt(IDL.Text),
    'registered_at' : IDL.Int,
    'species' : IDL.Text,
  });
  const Error = IDL.Variant({
    'InvalidInput' : IDL.Text,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'AlreadyExists' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : Pet, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  return IDL.Service({
    'getCounter' : IDL.Func([], [IDL.Nat], []),
    'getName' : IDL.Func([], [IDL.Text], []),
    'getPet' : IDL.Func([IDL.Nat], [Result_1], []),
    'getStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalPets' : IDL.Nat,
            'nextId' : IDL.Nat,
            'counterValue' : IDL.Nat,
          }),
        ],
        [],
      ),
    'getTotalPets' : IDL.Func([], [IDL.Nat], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'hello' : IDL.Func([], [IDL.Text], []),
    'increment' : IDL.Func([], [IDL.Nat], []),
    'listPets' : IDL.Func([], [IDL.Vec(Pet)], []),
    'registerPet' : IDL.Func([Pet], [Result], []),
    'reset' : IDL.Func([], [IDL.Nat], []),
    'searchPetsByOwner' : IDL.Func([IDL.Text], [IDL.Vec(Pet)], []),
  });
};
export const init = ({ IDL }) => { return []; };
