import { createContext } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

export const FormFieldContext = createContext<FormFieldContextValue | undefined>(undefined);

export type FormItemContextValue = {
  id: string;
};

export const FormItemContext = createContext<FormItemContextValue | undefined>(undefined);
