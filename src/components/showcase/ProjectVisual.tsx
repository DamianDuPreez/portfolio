import React from 'react';
import type { ProjectVisual as VisualKind } from '../../data/projects';
import InteractiveCreditCard from '../InteractiveCreditCard';
import PastelPencilBackground from '../PastelPencilBackground';
import CorporateSiteVisual from './CorporateSiteVisual';
import InvoiceVisual from './InvoiceVisual';
import VaultVisual from './VaultVisual';

interface Props {
  visual: VisualKind;
  // Whether the object should animate and respond to the mouse
  active: boolean;
}

const backgroundReversed: Record<VisualKind, boolean> = {
  'credit-card': false,
  'corporate-site': true,
  invoice: false,
  vault: true,
};

export const ProjectBackdrop: React.FC<{ visual: VisualKind }> = ({ visual }) => (
  <PastelPencilBackground reverse={backgroundReversed[visual]} />
);

const ProjectVisual: React.FC<Props> = ({ visual, active }) => {
  switch (visual) {
    case 'credit-card':
      return <InteractiveCreditCard disabled={!active} />;
    case 'corporate-site':
      return <CorporateSiteVisual active={active} />;
    case 'invoice':
      return <InvoiceVisual active={active} />;
    case 'vault':
      return <VaultVisual active={active} />;
  }
};

export default ProjectVisual;
