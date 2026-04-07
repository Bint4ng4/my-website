"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subjects } from "@/constants"
import { Textarea } from "./ui/textarea"
import { redirect } from "next/navigation"
import { createCompanion } from "@/lib/action/companion.actions"

    const formSchema = z.object({
            name: z
                .string()
                .min(1, "name is required.")
                ,
            subject: z
                .string()
                .min(1, "Subject is required.")
                ,
            topic: z
                .string()
                .min(1, { message: "Topic is required." })
                ,
            voice: z
                .string()
                .min(1, { message: "Voice is required." })
                ,
            style: z
                .string()
                .min(1, { message: "Style is required." })
                ,
            duration: z
                // .coerce
                .number()
                .min(1, { message: "Duration is required." })
                 ,
            })
    const   CompanionForm = () => {
            const form = useForm<z.infer<typeof formSchema>>({
                    resolver: zodResolver(formSchema),
                    defaultValues: {
                    name: '',
                    subject: '',
                    topic: '',
                    voice: '',
                    style: '',
                    duration: 15,
                    },
                })
                
            const onSubmit = async (values: z.infer<typeof formSchema>) => {
                    const companion = await createCompanion(values);

                    if (companion) {
                        redirect(`/companions/${companion.id}`)
                    } else {
                        console.log('Failed to create companion');
                        redirect('/');
                    }

                }
  return (
   <Card className="w-full sm:max-w-3xl">
      <CardContent>
        <form id="form-rhf" onSubmit={form.handleSubmit(onSubmit)}>
         
          <FieldGroup>
            
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Companion name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the companion name"
                    autoComplete="off"
                    className="input"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="subject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Subject
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input capitalize">
                      <SelectValue placeholder="Select the subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subjects.map((subject) => (
                          <SelectItem
                             value={subject}
                             key={subject}
                             className="capitalize">
                            {subject}
                             </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="topic"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    What should the companion help
                  </FieldLabel>
                  <Textarea
                    placeholder="Ex. Derivatives & Integrals"
                    {...field}
                    className="input"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="voice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Voice
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Select the voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                          <SelectItem value="male">
                            Male
                          </SelectItem>
                          <SelectItem value="female">
                            Female
                          </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="style"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Style
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Select the style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                          <SelectItem value="formal">
                            Formal
                          </SelectItem>
                          <SelectItem value="casual">
                            Casual
                          </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Estimate session duration in minutes
                  </FieldLabel>
                  <Input
                    type="number"
                    placeholder="15"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="input"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-rhf" className="w-full cursor-pointer">
            Build Your Companion
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

export default CompanionForm
