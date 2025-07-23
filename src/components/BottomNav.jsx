// src/components/BottomNav.jsx
import React from 'react';
import { Box, Button, Grid } from '@mui/material';

export default function BottomNav({
  onOpenCliente,
  onGenerarRemito,
  onGenerarPresupuesto,
  onGenerarSeguro,       // <- nuevo
  onCancelar
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'grey.900',
        p: 2,
        zIndex: 1000,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onOpenCliente}
          >
            Cliente
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={onGenerarRemito}
          >
            Remito
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={onGenerarPresupuesto}
          >
            Presupuesto
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            color="info"
            onClick={onGenerarSeguro}
          >
            Seguros
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={onCancelar}
          >
            Cancelar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
