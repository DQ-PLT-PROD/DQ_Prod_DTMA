import React, { createContext, useContext } from 'react';

const RoleSwitcherContext = createContext<any>(null);

export const RoleSwitcherProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <RoleSwitcherContext.Provider value={{}}>
            {children}
        </RoleSwitcherContext.Provider>
    );
};

export const useRoleSwitcher = () => useContext(RoleSwitcherContext);
