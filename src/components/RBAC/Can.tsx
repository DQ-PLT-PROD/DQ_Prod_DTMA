import React from 'react';
import { Can as CASLCan } from '../../context/AbilityContext';
import { Actions, Subjects } from '../../config/abilities';

export const Can = CASLCan as React.ComponentType<
  React.PropsWithChildren<{
    I?: Actions;
    do?: Actions;
    a?: Subjects;
    an?: Subjects;
    this?: Subjects;
    on?: Subjects;
    field?: string;
    not?: boolean;
    passThrough?: boolean;
    ability?: never;
  }>
>;

export default Can;
