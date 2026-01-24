import { Component, ReactNode, ErrorInfo } from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: "inline-flex",
                p: 2,
                borderRadius: "50%",
                bgcolor: "error.soft",
                color: "error.main",
              }}
            >
              <AlertTriangle size={48} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Ocurrió un error inesperado en la aplicación. Revisa la consola
              para más detalles técnicos.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: 200,
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                }}
              >
                {this.state.error.toString()}
              </Box>
            )}

            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={this.handleReload}
              sx={{ px: 4 }}
            >
              Recargar Página
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
