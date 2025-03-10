import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../popupTemplate/Popup';
import styles from './GetInviteCodePopup.module.css';
import React, { useEffect, useState } from 'react';
import copy from '../../../assets/copy-icon.png';
import { postRequest } from '../../../utils/routes';
import LoadingSpinner from '../../loadingSpinner/LoadingSpinner';
import resultCache from '../../../utils/cache';

export default function GetInviteCodePopup() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleCopyClicked = () => {
    if (inviteLink === null) {
      return;
    }
    navigator.clipboard.writeText(inviteLink);
  };

  useEffect(() => {
    const loadInviteLink = async () => {
      const cachedValue = resultCache.tryGet('invite-code') as string;
      if (cachedValue) {
        setInviteLink(cachedValue);
        return;
      }

      const response = await postRequest(
        `/api/v1/tournament/${tournamentId}/generate-invite-code`
      );
      if (response.status !== 200) {
        return null;
      }

      const json = await response.json();
      resultCache.add('invite-code', json.data);
      setInviteLink(json.data);
    };

    loadInviteLink();
  }, [tournamentId]);

  return (
    <Popup
      title="Invite Your Friends"
      disabled={false}
      handlePopupClosed={() => navigate(-1)}
    >
      {inviteLink != null ? (
        <div className={styles.inviteCodeSection}>
          <text className={styles.inviteCodeText}>
            {inviteLink !== null ? inviteLink : 'Failed to get invite code'}
          </text>
          {inviteLink !== null && (
            <button
              className={styles.copyButton}
              onClick={() => handleCopyClicked()}
            >
              <img
                className={styles.copyButtonImage}
                src={copy}
                alt="Copy"
              ></img>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.inviteCodeSection}>
          <LoadingSpinner />
        </div>
      )}
    </Popup>
  );
}
