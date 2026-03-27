import React from 'react';
import { SectionBlock } from '../../../design/primitives';
import { fontIntent } from '../../../lib/fonts';
import { createHeaderStyles as styles } from './createHeader.styles';

export function CreateHeader() {
  return (
    <SectionBlock
      eyebrow="Create"
      title={`Create\nan event`}
      description="Choose an activity, set the details, and invite others."
      titleVariant="screen"
      spacingMode="tight"
      titleStyle={[styles.title, { fontFamily: fontIntent.editorialHeadline }]}
      eyebrowStyle={styles.eyebrow}
      descriptionStyle={styles.subtitle}
      style={styles.header}
    />
  );
}
