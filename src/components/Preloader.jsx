import React from 'react';
import { Spinner } from 'react-bootstrap';

const Preloader = ({ show }) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
            <h5 className="mt-3 text-success fw-bold">Processing...</h5>
        </div>
    );
};

export default Preloader;