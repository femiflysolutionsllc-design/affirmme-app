import { useState } from "react";
import { SplitBill } from "../entities/SplitBill";

type Props = {
  onAdd: (bill: SplitBill) => void;
};

export default function SplitBillForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [people, setPeople] = useState<string>("");

  const handleSubmit = () => {
    const names = people.split(",").map(p => p.trim());
    const splitAmount = amount / names.length;

    const bill: SplitBill = {
      id: crypto.randomUUID(),
      title,
      totalAmount: amount,
      createdAt: new Date().toISOString(),
      settled: false,
      participants: names.map(name => ({
        id: crypto.randomUUID(),
        name,
        paid: 0,
        owes: splitAmount
      }))
    };

    onAdd(bill);
    setTitle("");
    setAmount(0);
    setPeople("");
  };

  return (
    <div className="card">
      <h3>Split a Bill</h3>

      <input
        placeholder="Bill name"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Total amount"
        value={amount}
        onChange={e => setAmount(+e.target.value)}
      />

      <input
        placeholder="People (comma separated)"
        value={people}
        onChange={e => setPeople(e.target.value)}
      />

      <button onClick={handleSubmit}>Add Bill</button>
    </div>
  );
}