import { Button } from '@/components/Button';
import { List } from '@/components/List';
import { PageHeader } from '@/components/PageHeader';
import { Progress } from '@/components/Progress';
import { Transaction, TransactionProps } from '@/components/Transaction';
import { TransactionTypes } from '@/utils/TransactionTypes';
import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';

const details = {
  current: 'R$ 580,00',
  target: 'R$ 1.780,00',
  percentage: 25,
};

const transactions: TransactionProps[] = [
  {
    id: '1',
    value: 'R$ 1.000,00',
    date: '2023-06-01',
    type: TransactionTypes.Output,
  },
  {
    id: '2',
    value: 'R$ 1.000,00',
    date: '2023-06-01',
    description: 'Salário',
    type: TransactionTypes.Input,
  },
];

export default function InProgress() {
  const params = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <PageHeader
        title="Apple Watch"
        rightButton={{
          icon: 'edit',
          onPress: () => {},
        }}
      />

      <Progress data={details} />

      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => <Transaction data={item} onRemove={() => {}} />}
        emptyMessage="Nenhuma transação encontrada. Toque em nova transação para guardar seu primeiro dinheiro aqui."
      />

      <Button title="Nova Transação" onPress={() => router.navigate(`/transaction/${params.id}`)} />
    </View>
  );
}
