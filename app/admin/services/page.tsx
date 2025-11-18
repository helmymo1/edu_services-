'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Service = {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
  profiles: {
    full_name: string | null;
  };
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();
      try {
        const { data, error } = await supabase.from('services').select('*, profiles(full_name)');
        if (error) throw error;
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleToggleActive = async (service: Service) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);
    if (error) {
      console.error('Error updating service:', error);
    } else {
      setServices(services.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.title}</TableCell>
                <TableCell>{service.profiles.full_name}</TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>{service.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleToggleActive(service)}>
                    {service.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
