import { ApiPaths } from '@/constants/api.constants';
import api from '@/services/api';
import type { UsuarioResponse, UsuarioUpdate } from '@/types/usuario.types';

// READ
export const getById = (id: number): Promise<UsuarioResponse> =>
  api.get<UsuarioResponse>(ApiPaths.usuario.byId(id)).then((r) => r.data);

// UPDATE
export const update = (id: number, patch: UsuarioUpdate): Promise<UsuarioResponse> =>
  api.put<UsuarioResponse>(ApiPaths.usuario.byId(id), patch).then((r) => r.data);

// DELETE
export const remove = (id: number): Promise<void> =>
  api.delete(ApiPaths.usuario.byId(id)).then(() => undefined);
