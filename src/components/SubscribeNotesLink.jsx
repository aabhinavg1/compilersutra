import React from 'react';
import Link from '@docusaurus/Link';

const SUBSCRIBE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform';

export default function SubscribeNotesLink() {
  return (
    <p className="margin-top--lg margin-bottom--md">
      <Link
        className="button button--outline button--primary"
        to={SUBSCRIBE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Subscribe to weekly notes
      </Link>
    </p>
  );
}
