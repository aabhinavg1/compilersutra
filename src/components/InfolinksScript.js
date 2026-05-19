import React, { useEffect } from 'react';

export default function InfolinksScript() {
  // Infolinks is intentionally disabled. Keep the component as a no-op so
  // existing markdown imports do not need to change.
  useEffect(() => {
    return undefined;
  }, []);

  return null;
}
