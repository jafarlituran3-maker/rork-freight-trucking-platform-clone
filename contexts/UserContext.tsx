import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { CompanyProfile } from '@/types';

export type UserRole = 'customer' | 'carrier' | 'dispatcher';

export interface UserProfile {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  role: UserRole;
  companyId?: string;
  phone: string;
  email: string;
  avatar?: string;
  passport?: string;
  address?: string;
  dateOfBirth?: string;
}

export const [UserContext, useUser] = createContextHook(() => {
  const [user, setUser] = useState<UserProfile>({
    id: '1',
    fullName: 'Иван Петров',
    firstName: 'Иван',
    lastName: 'Петров',
    role: 'customer',
    companyId: '1',
    phone: '+7 (495) 123-45-67',
    email: 'ivan.petrov@logistics.ru',
  });

  const [company, setCompany] = useState<CompanyProfile | null>({
    id: '1',
    name: 'ООО "Логистика+"',
    legalAddress: 'г. Москва, ул. Ленина, д. 1',
    actualAddress: 'г. Москва, ул. Ленина, д. 1',
    inn: '7743013902',
    kpp: '774301001',
    ogrn: '1027700132195',
    bankName: 'ПАО Сбербанк',
    bankAccount: '40702810400000001234',
    bankCorrespondentAccount: '30101810400000000225',
    bankBic: '044525225',
    numberOfVehicles: 15,
    directorName: 'Петров Иван Иванович',
    phone: '+7 (495) 123-45-67',
    email: 'info@logistics.ru',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateCompany = useCallback((updates: Partial<CompanyProfile>) => {
    setCompany((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  const createCompany = useCallback((newCompany: CompanyProfile) => {
    setCompany(newCompany);
    setUser((prev) => ({ ...prev, companyId: newCompany.id }));
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
  }, []);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  return useMemo(
    () => ({
      user,
      setUser,
      company,
      setCompany,
      updateUser,
      updateCompany,
      createCompany,
      switchRole,
      isMenuOpen,
      openMenu,
      closeMenu,
      toggleMenu,
    }),
    [user, company, updateUser, updateCompany, createCompany, switchRole, isMenuOpen, openMenu, closeMenu, toggleMenu]
  );
});
