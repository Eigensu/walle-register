import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type PlayerFormValues } from "@/lib/validators";

type JerseyDetailsStepProps = {
  form: UseFormReturn<PlayerFormValues>;
  fieldClass: string;
};

export function JerseyDetailsStep({
  form,
  fieldClass,
}: JerseyDetailsStepProps) {
  const tshirtSizes = [
    { value: "XS", label: "34 - XS" },
    { value: "S", label: "36 - S" },
    { value: "M", label: "38 - M" },
    { value: "L", label: "40 - L" },
    { value: "XL", label: "42 - XL" },
    { value: "XXL", label: "44 - XXL" },
    { value: "XXXL", label: "46 - XXXL" },
    { value: "XXXXL", label: "48 - XXXXL" },
  ];
  const waistOptions = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="jersey_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jersey Number (optional)</FormLabel>
            <FormControl>
              <input {...field} type="number" min={0} max={99} inputMode="numeric" placeholder="0–99" className={fieldClass} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="name_on_jersey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name on Jersey</FormLabel>
            <FormControl>
              <input
                {...field}
                type="text"
                placeholder="Your jersey name (max 15 chars)"
                maxLength={15}
                className={fieldClass}
              />
            </FormControl>
            <FormDescription>Max 15 characters</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tshirt_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>T-Shirt Size</FormLabel>
            <FormControl>
              <select
                {...field}
                value={field.value ?? ""}
                className={`${fieldClass} w-full min-w-0 cursor-pointer`}
              >
                <option value="">Select T-shirt size</option>
                {tshirtSizes.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="waist_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Waist Size</FormLabel>
            <FormControl>
              <select {...field} className={`${fieldClass} w-full min-w-0 cursor-pointer`}>
                <option value="">Select waist size</option>
                {waistOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormDescription>
              Select from standard sizes (in inches)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
