import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SupportTicketsPage from "./SupportTicketsPage";
import CreateTicketDrawer from "../components/support/CreateTicketDrawer";
import type { CreateTicketPreset } from "../components/support/CreateTicketDrawer";

interface Props {
  preset?: CreateTicketPreset;
  autoOpen?: boolean;
}

export default function SupportPageWrapper({ preset, autoOpen }: Props) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(!!autoOpen);
  const [drawerPreset, setDrawerPreset] = useState<CreateTicketPreset | undefined>(preset);

  const openDrawer = useCallback((p?: CreateTicketPreset) => {
    setDrawerPreset(p);
    setDrawerOpen(true);
  }, []);

  const handleCreated = useCallback((ticketId: string) => {
    setDrawerOpen(false);
    navigate(`/account/support/${ticketId}`);
  }, [navigate]);

  return (
    <>
      <SupportTicketsPage onCreateTicket={() => openDrawer()} />
      <CreateTicketDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
        preset={drawerPreset}
      />
    </>
  );
}
