import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';

import { useAuth, AuthProvider } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    const apiResponse = {
      user: {
        id: '079d97f1-fbe8-411a-a627-4ed10b26ed91',
        name: 'Teste',
        email: 'teste@teste.com.br',
        avatar: 'image.jpg',
      },
      token: 'token',
    };

    apiMock.onPost('sessions').reply(200, apiResponse);

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'teste@teste.com.br',
      password: '123456',
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:token',
      apiResponse.token,
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(apiResponse.user),
    );

    expect(result.current.user.email).toEqual('teste@teste.com.br');
  });

  it('should restore saved data from storage when auth inits', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(key => {
      switch (key) {
        case '@GoBarber:token':
          return 'token';
        case '@GoBarber:user':
          return JSON.stringify({
            id: '079d97f1-fbe8-411a-a627-4ed10b26ed91',
            name: 'Teste',
            email: 'teste@teste.com.br',
            avatar: 'image.jpg',
          });
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual('teste@teste.com.br');
  });

  it('should be able to sign out', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(key => {
      switch (key) {
        case '@GoBarber:token':
          return 'token';
        case '@GoBarber:user':
          return JSON.stringify({
            id: '079d97f1-fbe8-411a-a627-4ed10b26ed91',
            name: 'Teste',
            email: 'teste@teste.com.br',
            avatar: 'image.jpg',
          });
        default:
          return null;
      }
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it('should be able to update user data', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const user = {
      id: '079d97f1-fbe8-411a-a627-4ed10b26ed91',
      name: 'Teste',
      email: 'teste@teste.com.br',
      avatar_url: 'image.jpg',
    };

    act(() => {
      result.current.updateUser(user);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(user),
    );
    expect(result.current.user).toEqual(user);
  });
});
