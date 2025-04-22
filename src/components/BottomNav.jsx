import React from 'react';
import { Box, Button, Grid } from '@mui/material';

export default function BottomNav({
  onOpenCliente,
  onGenerarRemito,
  onCancelar,
  onBuscarPedido
}) {
  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: 'grey.900', p: 2, zIndex: 1000
    }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Button fullWidth variant="contained" color="primary" sx={{ py:2, borderRadius:2 }}
            onClick={onOpenCliente}>
            Cliente
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth variant="contained" color="success" sx={{ py:2, borderRadius:2 }}
            onClick={onGenerarRemito}>
            Generar Remito
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth variant="contained" color="error" sx={{ py:2, borderRadius:2 }}
            onClick={onCancelar}>
            Cancelar
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth variant="contained" color="info" sx={{ py:2, borderRadius:2 }}
            onClick={onBuscarPedido}>
            Buscar Pedido
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
