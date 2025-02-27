import { useLoaderData, useNavigate } from 'react-router-dom';
import Popup from '../popupTemplate/Popup';
import styles from './GetInviteCodePopup.module.css';
import React from 'react';
import copy from '../../../assets/copy.png';

export default function GetInviteCodePopup() {
  const navigate = useNavigate();
  const inviteCode: string | null = useLoaderData() as string | null;

  const handleCopyClicked = () => {
    if (inviteCode === null) {
      return;
    }
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <Popup
      title="Invite Your Friends"
      disabled={false}
      handlePopupClosed={() => navigate(-1)}
    >
      <div className={styles.inviteCodeSection}>
        <text className={styles.inviteCodeText}>
          {inviteCode !== null ? inviteCode : 'Failed to get invite code'}
        </text>
        {inviteCode !== null && (
          <button
            className={styles.copyButton}
            onClick={() => handleCopyClicked()}
          >
            <img className={styles.copyButtonImage} src={copy} alt="Copy"></img>
          </button>
        )}
      </div>
    </Popup>
  );
}
