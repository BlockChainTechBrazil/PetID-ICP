export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getCounter' : IDL.Func([], [IDL.Nat], []),
    'getName' : IDL.Func([], [IDL.Text], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'hello' : IDL.Func([], [IDL.Text], []),
    'increment' : IDL.Func([], [IDL.Nat], []),
    'reset' : IDL.Func([], [IDL.Nat], []),
  });
};
export const init = ({ IDL }) => { return []; };
