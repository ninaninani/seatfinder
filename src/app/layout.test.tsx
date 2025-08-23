import { render, screen } from '@/lib/test-utils';
import RootLayout from './layout';

describe('Root Layout', () => {
  it('renders children correctly', () => {
    const testContent = 'Test Child Content';

    render(
      <RootLayout>
        <div>{testContent}</div>
      </RootLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('renders with proper HTML structure', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check that the layout renders a proper HTML structure
    expect(document.querySelector('html')).toBeInTheDocument();
    expect(document.querySelector('body')).toBeInTheDocument();
  });
});
