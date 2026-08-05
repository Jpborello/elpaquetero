'use client';

import { useState } from 'react';
import { X, Lock, Phone, User, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (isRegistering && !name) {
      setErrorMsg('Por favor ingresá tu nombre completo o razón social.');
      return;
    }

    if (isRegistering) {
      onRegister(name, phone, password);
    } else {
      onLogin(phone, password);
    }

    setName('');
    setPhone('');
    setPassword('');
    onClose();
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-box">
        <button 
          onClick={onClose} 
          className="qty-btn" 
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            {isRegistering ? 'Registro de Cliente Mayorista' : 'Iniciar Sesión'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isRegistering ? 'Ingresá tus datos para realizar tus compras' : 'Accedé a tu cuenta mayorista'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ 
            backgroundColor: '#FFEBEE', 
            color: '#C62828', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.85rem',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">
                <User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Nombre Completo / Razón Social
              </label>
              <input 
                type="text" 
                placeholder="Ej: Indumentaria San Martín" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="form-input" 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Número de Teléfono
            </label>
            <input 
              type="text" 
              placeholder="Ej: 1122334455" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Contraseña
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="form-input" 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
            {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegistering ? 'Crear Cuenta Mayorista' : 'Acceder'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegistering ? '¿Ya tenés cuenta?' : '¿Sos cliente nuevo?'}
          </span>{' '}
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={{ fontWeight: 700, color: 'var(--accent-gold-hover)', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Iniciá Sesión' : 'Registrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}
