"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chunithmData, maimaiData } from "@/lib/mock-data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";

const chunithmChartConfig = {
  rating: {
    label: "레이팅",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const maimaiChartConfig = {
    rating: {
      label: "레이팅",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

export function ProfileDisplay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">성과 개요</CardTitle>
        <CardDescription>
          츄니즘과 마이마이에 대한 상세 통계입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chunithm">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chunithm">츄니즘</TabsTrigger>
            <TabsTrigger value="maimai">마이마이</TabsTrigger>
          </TabsList>
          <TabsContent value="chunithm" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>레이팅 진행률</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chunithmChartConfig} className="h-[200px] w-full">
                  <AreaChart
                    accessibilityLayer
                    data={chunithmData.ratingHistory}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                       domain={['dataMin - 0.2', 'dataMax + 0.2']}
                       tickLine={false}
                       axisLine={false}
                       tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <defs>
                      <linearGradient id="fillRatingC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-rating)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-rating)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="rating"
                      type="natural"
                      fill="url(#fillRatingC)"
                      stroke="var(--color-rating)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>최근 플레이</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>곡</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>랭크</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chunithmData.recentPlays.map((play) => (
                      <TableRow key={play.song}>
                        <TableCell className="font-medium">{play.song}</TableCell>
                        <TableCell>{play.score.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={play.rank === 'SSS' ? 'default' : 'secondary'}>{play.rank}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="maimai" className="space-y-6 pt-4">
          <Card>
              <CardHeader>
                <CardTitle>레이팅 진행률</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={maimaiChartConfig} className="h-[200px] w-full">
                  <AreaChart
                    accessibilityLayer
                    data={maimaiData.ratingHistory}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                       domain={['dataMin - 200', 'dataMax + 200']}
                       tickLine={false}
                       axisLine={false}
                       tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                     <defs>
                      <linearGradient id="fillRatingM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-rating)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-rating)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="rating"
                      type="natural"
                      fill="url(#fillRatingM)"
                      stroke="var(--color-rating)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>최근 플레이</CardTitle>
              </CardHeader>
              <CardContent>
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>곡</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>랭크</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maimaiData.recentPlays.map((play) => (
                      <TableRow key={play.song}>
                        <TableCell className="font-medium">{play.song}</TableCell>
                        <TableCell>{play.score.toFixed(4)}%</TableCell>
                        <TableCell>
                          <Badge variant={play.rank === 'SSS+' ? 'default' : 'secondary'}>{play.rank}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
