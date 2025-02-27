import React, { useEffect, useRef, useState } from 'react';
import styles from './TournamentSettingsMenu.module.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function TournamentSettingsMenu() {
  const navigate = useNavigate();
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const settingsButton = useRef<HTMLButtonElement>(null);
  const settingsMenu = useRef<HTMLDivElement>(null);

  const { tournamentId } = useParams<{ tournamentId: string }>();
  const currentTournamentId: number = tournamentId
    ? Number.parseInt(tournamentId)
    : -1;

  const handleMenuToggle = (open: boolean) => {
    if (settingsButton.current) {
      const rect = settingsButton.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: rect.right });
    }
    setIsSettingsMenuOpen(open);
  };

  useEffect(() => {
    if (!isSettingsMenuOpen) {
      return;
    }

    const handleClickAway = (event: MouseEvent) => {
      if (
        settingsMenu.current?.contains(event.target as Node) ||
        settingsMenu.current?.contains(event.target as Node)
      ) {
        return;
      }

      setIsSettingsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [isSettingsMenuOpen]);

  const handleInviteClicked = () => {
    navigate(`/tournament/${currentTournamentId}/invite`);
    setIsSettingsMenuOpen(false);
  };

  const handleLeaveClicked = () => {
    navigate(`/tournament/${currentTournamentId}/leave`);
    setIsSettingsMenuOpen(false);
  };

  return (
    <div className={styles.buttonContainer}>
      <button
        ref={settingsButton}
        className={styles.settingsButton}
        onClick={() => handleMenuToggle(!isSettingsMenuOpen)}
      >
        V
      </button>
      {isSettingsMenuOpen && (
        <div
          ref={settingsMenu}
          style={{
            position: 'fixed',
            width: '200px',
            top: `${position.top}px`,
            left: `${position.left - 200}px`,
            background: 'white',
            border: '2px solid #1e488b',
            borderRadius: '5px',
            padding: '1px',
            zIndex: 20,
          }}
        >
          <button
            className={styles.menuItem}
            onClick={() => handleInviteClicked()}
          >
            Get Invite Link
          </button>
          <button
            className={styles.menuItem}
            onClick={() => handleLeaveClicked()}
          >
            Leave Tournament
          </button>
        </div>
      )}
    </div>
  );
}
