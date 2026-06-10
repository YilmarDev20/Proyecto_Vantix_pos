import { Toaster } from 'sonner';
import { AppRouter } from '@/routes/AppRouter';
import { AuthProvider } from '@/core/auth/context/AuthContext';
import { StoreProvider } from '@/core/store/context/StoreContext';
import { ThemeProvider } from '@/core/theme/context/ThemeContext'; // ✅ NUEVO IMPORT

function App() {
  return (
    <ThemeProvider> {/* ✅ PASO CLAVE: Envolvemos toda la suite desde la raíz del árbol */}
      <AuthProvider>
        <StoreProvider>
          <Toaster position="top-right" richColors />
          <AppRouter />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;