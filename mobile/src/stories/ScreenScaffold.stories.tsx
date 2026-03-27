import type { Meta, StoryObj } from '@storybook/react-native';
import { Text } from 'react-native';
import { Button, Card, ScreenScaffold, SectionBlock } from '../design/primitives';
import { withStoryScreenFrame } from './support';

function ScreenScaffoldStory() {
  return (
    <ScreenScaffold>
      <SectionBlock
        eyebrow="Editorial rhythm"
        title="Shared screen scaffold"
        titleVariant="screen"
        description="This story keeps the new gutter, header, and section spacing visible in one isolated surface."
        spacingMode="tight"
      />
      <SectionBlock eyebrow="Primary section">
        <Card>
          <Text>One surface, one focal point, and consistent horizontal rhythm.</Text>
        </Card>
      </SectionBlock>
      <SectionBlock eyebrow="Secondary section" spacingMode="tight">
        <Button label="Review layout" onPress={() => undefined} variant="secondary" />
      </SectionBlock>
    </ScreenScaffold>
  );
}

const meta = {
  title: 'Layout/ScreenScaffold',
  component: ScreenScaffoldStory,
  decorators: [withStoryScreenFrame({ height: 860, width: 430 })],
} satisfies Meta<typeof ScreenScaffoldStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
