import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmButton } from '../components/molecules/ConfirmButton';

describe('ConfirmButton', () => {
  it('renders Confirm button in idle state', () => {
    render(<ConfirmButton status="idle" onConfirm={() => {}} onRetry={() => {}} />);
    expect(screen.getByText('Confirm')).toBeDefined();
  });

  it('renders Pending in pending state', () => {
    render(<ConfirmButton status="pending" onConfirm={() => {}} onRetry={() => {}} />);
    expect(screen.getByText('Pending')).toBeDefined();
  });

  it('renders Confirmed badge in confirmed state', () => {
    render(<ConfirmButton status="confirmed" onConfirm={() => {}} onRetry={() => {}} />);
    expect(screen.getByText('Confirmed')).toBeDefined();
  });

  it('renders Failed badge and Retry button in failed state', () => {
    render(<ConfirmButton status="failed" onConfirm={() => {}} onRetry={() => {}} />);
    expect(screen.getByText('Failed')).toBeDefined();
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('calls onConfirm when Confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmButton status="idle" onConfirm={onConfirm} onRetry={() => {}} />);
    await userEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onRetry when Retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ConfirmButton status="failed" onConfirm={() => {}} onRetry={onRetry} />);
    await userEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
