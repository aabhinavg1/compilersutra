import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import SubscribeNotesLink from '@site/src/components/SubscribeNotesLink';

export default function DocItemFooterWrapper(props) {
  return (
    <>
      <SubscribeNotesLink />
      <Footer {...props} />
    </>
  );
}
