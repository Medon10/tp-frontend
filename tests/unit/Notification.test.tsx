/**
 *
 * El componente Notification recibe:
 *   - message: string    → texto a mostrar
 *   - type: 'success' | 'error' → clase CSS aplicada al banner
 *   - onClose: () => void → callback al clickear el botón ×
 *
 * Renderiza:
 *   <div class="notification-banner {type}">
 *     <p>{message}</p>
 *     <button>×</button>
 *   </div>
 *
 * Usamos React Testing Library + jest-dom matchers.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Notification } from '../../src/components/layout/Notification';

// Tests 

describe('<Notification />', () => {

  //1. Renderiza el mensaje correctamente 
  describe('Renderizado del mensaje', () => {
    /**
     * Verifica que el texto pasado como prop "message" aparece
     * en el DOM dentro de un <p>.
     */
    it('muestra el texto del mensaje en pantalla', () => {
      render(
        <Notification message="Operación exitosa" type="success" onClose={() => {}} />
      );

      expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
    });

    it('renderiza mensajes con caracteres especiales', () => {
      render(
        <Notification message="Error: código 404 — recurso no encontrado" type="error" onClose={() => {}} />
      );

      expect(screen.getByText('Error: código 404 — recurso no encontrado')).toBeInTheDocument();
    });
  });

  // 2. Clases CSS según el type 
  describe('Clases CSS según type', () => {
    /**
     * El div contenedor debe tener siempre la clase "notification-banner"
     * más la clase correspondiente al type ('success' o 'error').
     */
    it('aplica la clase "notification-banner success" cuando type es "success"', () => {
      const { container } = render(
        <Notification message="Guardado" type="success" onClose={() => {}} />
      );

      const banner = container.firstElementChild as HTMLElement;
      expect(banner).toHaveClass('notification-banner');
      expect(banner).toHaveClass('success');
    });

    it('aplica la clase "notification-banner error" cuando type es "error"', () => {
      const { container } = render(
        <Notification message="Falló" type="error" onClose={() => {}} />
      );

      const banner = container.firstElementChild as HTMLElement;
      expect(banner).toHaveClass('notification-banner');
      expect(banner).toHaveClass('error');
    });

    it('no aplica la clase "error" cuando type es "success"', () => {
      const { container } = render(
        <Notification message="OK" type="success" onClose={() => {}} />
      );

      const banner = container.firstElementChild as HTMLElement;
      expect(banner).not.toHaveClass('error');
    });

    it('no aplica la clase "success" cuando type es "error"', () => {
      const { container } = render(
        <Notification message="Fail" type="error" onClose={() => {}} />
      );

      const banner = container.firstElementChild as HTMLElement;
      expect(banner).not.toHaveClass('success');
    });
  });

  // 3. Botón de cierre ejecuta onClose 
  describe('Botón de cierre (onClose)', () => {
    /**
     * El botón × dentro del banner dispara el callback onClose
     * al hacer click. Usamos vi.fn() para crear un spy y verificar
     * que fue llamado exactamente una vez.
     */
    it('llama a onClose al hacer click en el botón ×', () => {
      const onCloseSpy = vi.fn();

      render(
        <Notification message="Test" type="success" onClose={onCloseSpy} />
      );

      const boton = screen.getByRole('button');
      fireEvent.click(boton);

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('no llama a onClose si no se hace click', () => {
      const onCloseSpy = vi.fn();

      render(
        <Notification message="Test" type="error" onClose={onCloseSpy} />
      );

      expect(onCloseSpy).not.toHaveBeenCalled();
    });

    it('llama a onClose una vez por cada click', () => {
      const onCloseSpy = vi.fn();

      render(
        <Notification message="Test" type="success" onClose={onCloseSpy} />
      );

      const boton = screen.getByRole('button');
      fireEvent.click(boton);
      fireEvent.click(boton);
      fireEvent.click(boton);

      expect(onCloseSpy).toHaveBeenCalledTimes(3);
    });
  });

  // 4. Estructura del componente
  describe('Estructura del DOM', () => {
    /**
     * Verificaciones adicionales sobre la estructura renderizada.
     */
    it('el mensaje está dentro de un elemento <p>', () => {
      render(
        <Notification message="Info" type="success" onClose={() => {}} />
      );

      const parrafo = screen.getByText('Info');
      expect(parrafo.tagName).toBe('P');
    });

    it('contiene exactamente un botón', () => {
      render(
        <Notification message="Info" type="error" onClose={() => {}} />
      );

      const botones = screen.getAllByRole('button');
      expect(botones).toHaveLength(1);
    });

    it('el botón contiene el símbolo ×', () => {
      render(
        <Notification message="Info" type="success" onClose={() => {}} />
      );

      const boton = screen.getByRole('button');
      expect(boton.textContent).toBe('×');
    });
  });
});
