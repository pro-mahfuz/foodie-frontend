
import { Party, ReceivablePayableReport } from './partyTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectPartyStatus = (state: RootState) => state.party.status;
export const selectPartyError = (state: RootState) => state.party.error;
export const selectAllParties = (state: RootState): Party[] => state.party.parties || [];

export const selectTotalPages = (state: RootState) => state.party.totalPages;
export const selectCurrentPage = (state: RootState) => state.party.currentPage;
export const selectTotalItems = (state: RootState) => state.party.totalItems;

export const selectAllPartyPagination = (state: RootState): Party[] => state.party.partiesPaginated || [];

export const selectParties = (businessId: number, partyType: string) =>
  createSelector([selectAllParties], (parties) => {
    if (businessId === 0 && partyType === "all") return parties;
    if (businessId === 0 && partyType)
      return parties.filter(party => party.type === partyType);
    if (businessId > 0 && partyType === "all")
      return parties.filter(party => party.businessId === businessId);
    if (businessId > 0 && partyType)
      return parties.filter(
        party => party.type === partyType && party.businessId === businessId
      );
    return [];
  });

export const selectReceivablePayable = (state: RootState): ReceivablePayableReport | null => state.party.receivablePayableReport;


export const selectPartyById = (id: number) => (state: RootState) => state.party.parties.find(party => party.id === id);

export const searchPartyByText = (text: string) => (state: RootState) => {
  const search = text.toLowerCase();
  return state.party.parties.filter(party =>
    party.name.toLowerCase().includes(search) ||
    (party.phoneNumber && party.phoneNumber.toLowerCase().includes(search)) ||
    (party.email && party.email.toLowerCase().includes(search))
  );
};

export const selectAllSuppliers = createSelector(
  [selectAllParties],
  (parties) => parties.filter(party => party.type === 'supplier')
);

export const selectAllCustomers = createSelector(
  [selectAllParties],
  (parties) => parties.filter(party => party.type === 'customer')
);

export const selectTotalCustomer = createSelector(
  [selectAllParties],
  (parties: Party[]) => parties.filter(party => party.type === 'customer').length
);

export const selectTotalParty = createSelector(
  [selectAllParties],
  (parties: Party[]) => parties.length
);