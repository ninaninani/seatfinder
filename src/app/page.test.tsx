import { render, screen } from '@/lib/test-utils';
import Page from './page';

describe('Home Page', () => {
  it('renders the Next.js logo', () => {
    render(<Page />);

    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders the getting started text', () => {
    render(<Page />);

    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
  });

  it('renders the save and see changes text', () => {
    render(<Page />);

    expect(
      screen.getByText(/Save and see your changes instantly/i)
    ).toBeInTheDocument();
  });

  it('renders the deploy now link', () => {
    render(<Page />);

    const deployLink = screen.getByRole('link', { name: /Deploy now/i });
    expect(deployLink).toBeInTheDocument();
  });

  it('renders the read docs link', () => {
    render(<Page />);

    const docsLink = screen.getByRole('link', { name: /Read our docs/i });
    expect(docsLink).toBeInTheDocument();
  });
});
