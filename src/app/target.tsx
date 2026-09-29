import { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useTargetDataBase } from '@/database/useTargetDataBase';

export default function Target() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | null>(0);

  const params = useLocalSearchParams<{ id?: string }>();
  const targetDataBase = useTargetDataBase();

  function handleSave() {
    if (!name.trim() || amount === null || amount <= 0) {
      return Alert.alert('Atenção', 'Preencha todos os campos corretamente.');
    }

    setIsProcessing(true);

    if (params.id) {
      update();
    } else {
      create();
    }
  }

  async function update() {
    try {
      await targetDataBase.update({ id: Number(params.id), name, amount: amount || 0 });
      Alert.alert('Sucesso!', 'Meta atualizada com sucesso!', [
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel atualizar a meta.');
      console.log(error);
      setIsProcessing(false);
    }
  }

  async function create() {
    try {
      await targetDataBase.create({ name, amount: amount || 0 });
      Alert.alert('Sucesso', 'Meta criada com sucesso.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao criar a meta. Tente novamente.');
      console.log(error);
      setIsProcessing(false);
    }
  }

  async function fetchDetails(id: number) {
    try {
      const response = await targetDataBase.show(id);

      if (!response) {
        return Alert.alert('Erro', 'Meta não encontrada.');
      }

      setName(response.name);
      setAmount(response.amount);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel carregar os detalhes da meta.');
      console.log(error);
    }
  }

  function handleRemove() {
    if (!params.id) {
      return;
    }

    Alert.alert('Remover', 'Deseja realmente remover?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      { text: 'Sim', onPress: () => remove() },
    ]);
  }
  async function remove() {
    try {
      setIsProcessing(true);

      await targetDataBase.remove(Number(params.id));
      Alert.alert('Meta', 'Meta removida!', [{ text: 'Ok', onPress: () => router.replace('/') }]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel remover a meta.');
      console.log(error);
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchDetails(Number(params.id));
    }
  }, [params.id]);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira."
        rightButton={params.id ? { icon: 'delete', onPress: () => handleRemove() } : undefined}
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <Input
          label="Nome da meta"
          placeholder="Ex: Viagem para praia, Apple Watch"
          onChangeText={setName}
          value={name}
        />

        <CurrencyInput label="Valor alvo (R$)" value={amount} onChangeValue={setAmount} />

        <Button title="Salvar" onPress={handleSave} isProcessing={isProcessing} />
      </View>
    </View>
  );
}
