import { SplitBill } from "../entities/SplitBill";

type Props = {
  bills: SplitBill[];
};

export default function SplitBillList({ bills }: Props) {
  return (
    <div>
      {bills.map(bill => (
        <div key={bill.id} className="card">
          <h4>{bill.title}</h4>
          <p>Total: ${bill.totalAmount}</p>

          <ul>
            {bill.participants.map(p => (
              <li key={p.id}>
                {p.name} owes ${p.owes.toFixed(2)}
              </li>
            ))}
          </ul>

          <p>Status: {bill.settled ? "✅ Settled" : "⏳ Open"}</p>
        </div>
      ))}
    </div>
  );
}