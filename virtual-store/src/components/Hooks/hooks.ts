import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

// Use this instead of plain `useSelector` throughout your app
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
