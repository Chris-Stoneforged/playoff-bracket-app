import React from 'react';
import styles from './NoneSelected.module.css';
import background from '../../assets/background.webp';

export default function NoneSelected() {
  return (
    <div className={styles.noTournamentDefault}>
      <img alt="" src={background} className={styles.background} />
      <p>
        <b>Select</b>, <b>Create</b>, or <b>Join</b> a tournament to get
        started!
      </p>
    </div>
  );
}
