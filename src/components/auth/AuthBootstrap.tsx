import { useEffect } from 'react';
import { bootstrapAuth } from '../../hooks/useAuth';

export default function AuthBootstrap() {
  useEffect(() => {
    void bootstrapAuth();
  }, []);

  return null;
}
