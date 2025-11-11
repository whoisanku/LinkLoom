import Page from '@/components/ui/Page';
import Title from './components/Title';
import { CONSTANTS } from './constant/data.const';
import { useParams, useNavigate } from 'react-router-dom';
import { useTarget } from './hooks/useTarget';
import { useIntroducer } from './hooks/useIntroducer';
import Table from '@ui/Table';
import type { ColumnDef } from '@tanstack/react-table';
import type { TIntroducer } from './type/data';
import { useMemo, useCallback, useState } from 'react';
import Button from '@/components/ui/Button';
import RequestIntroductionModal from './components/RequestIntroductionModal';

export default function Target() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTargetById } = useTarget();
  const { introducers } = useIntroducer();
  const [selectedIntroducer, setSelectedIntroducer] = useState<TIntroducer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const target = useMemo(() => {
    if (!id) return null;
    return getTargetById(id);
  }, [id, getTargetById]);

  const connectedIntroducers = useMemo(() => {
    if (!target) return [];
    return introducers.filter(introducer =>
      introducer.connections.includes(target.id)
    );
  }, [introducers, target]);

  const availableIntroducers = useMemo(() => {
    if (!target) return [];
    return introducers.filter(introducer =>
      !introducer.connections.includes(target.id)
    );
  }, [introducers, target]);

  const handleIntroducerClick = useCallback((introducer: TIntroducer) => {
    console.log('Clicked introducer:', introducer);
  }, []);

  const handleConnect = useCallback((introducer: TIntroducer) => {
    setSelectedIntroducer(introducer);
    setModalOpen(true);
  }, []);

  const connectedColumns: ColumnDef<TIntroducer>[] = useMemo(() => [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.username}</div>
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-secondary">{row.original.score}</div>
        </div>
      ),
    },
    {
      accessorKey: 'connections',
      header: 'Total Connections',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-300">{row.original.connections.length}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
            Connected
          </span>
        </div>
      ),
    },
  ], []);

  const availableColumns: ColumnDef<TIntroducer>[] = useMemo(() => [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.username}</div>
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-secondary">{row.original.score}</div>
        </div>
      ),
    },
    {
      accessorKey: 'connections',
      header: 'Total Connections',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-300">{row.original.connections.length}</div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleConnect(row.original);
          }}
          className="text-sm"
        >
          Request Introduction
        </Button>
      ),
    },
  ], [handleConnect]);

  if (!target) {
    return (
      <Page>
        <div className="flex flex-col gap-2">
          <Title mainheading="Target Not Found" subHeading="The requested target does not exist" />
          <Button onClick={() => navigate('/targets')}>Back to Targets</Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className='flex flex-col gap-6'>
        <div className="flex flex-col gap-2">
          <Title mainheading={target.username} subHeading={''} />
          <div className='h-96 w-64 bg-green-300 mx-auto'>
          </div>

          <div className="bg-header p-4 rounded-lg border border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Score</div>
                <div className="text-2xl font-bold text-secondary">{target.score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Connected Introducers</div>
                <div className="text-2xl font-bold text-white">{connectedIntroducers.length}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-400">Relevance</div>
              <div className="text-sm text-gray-200 mt-1">{target.relevance}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Connected Introducers ({connectedIntroducers.length})
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              These introducers already have a connection with this target
            </p>
          </div>
          {connectedIntroducers.length > 0 ? (
            <Table
              data={connectedIntroducers}
              columns={connectedColumns}
              onRowClick={handleIntroducerClick}
            />
          ) : (
            <div className="bg-header p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-400">No connected introducers yet</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Available Introducers ({availableIntroducers.length})
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Request introductions from these introducers
            </p>
          </div>
          {availableIntroducers.length > 0 ? (
            <Table
              data={availableIntroducers}
              columns={availableColumns}
              onRowClick={handleIntroducerClick}
            />
          ) : (
            <div className="bg-header p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-400">All introducers are already connected</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => navigate(-1)} className="mt-4">
            ← Back
          </Button>
        </div>
      </div>

      {/* Request Introduction Modal */}
      {selectedIntroducer && target && (
        <RequestIntroductionModal
          introducer={selectedIntroducer}
          target={target}
          trigger={<></>}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </Page>
  );
}
