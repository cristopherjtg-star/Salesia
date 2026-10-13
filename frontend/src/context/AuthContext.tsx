const login = async (dni: string, pass: string) => {
    try {
      // ✅ Quitamos la barra inicial para que se concatene correctamente con /api/v1
      const response = await api.post('auth/login', { dni, password: pass });
      const { access_token, ...userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Error al iniciar sesión' 
      };
    }
  };