import React from 'react';
import styles from './Loadable.module.css';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';

export type LoadableProps = {
  isLoading: boolean;
  children: React.ReactNode;
};

export default function Loadable({ isLoading, children }: LoadableProps) {
  return isLoading ? (
    <div className={styles.wrapper}>
      <LoadingSpinner />
    </div>
  ) : (
    children
  );
}
