/* eslint-disable @next/next/no-img-element */
import { NormalContainer } from "@/components/layout/container/NomalContainer"
import Link from "next/link"
import friendData from "./config"


const FriendCard = (data : {
  name: string,
  link: string,
  avatar: string,
  desc: string
}) => {
  return (
    <Link className="rounded-lg flex px-3 py-4 bg-zinc-200 dark:bg-zinc-600 w-full lg:w-[calc(50%-5px)] mb-3" href={data.link}>
      <img className="rounded-lg h-14 w-14" src={data.avatar} alt={data.name} />
      <div className="ml-3 h-14 flex flex-col justify-between">
        <div className="font-bold">{data.name}</div>
        <div className="mt-3 break-all text-wrap">{data.desc}</div>
      </div>
    </Link>
  )
}

export default function Friends(){
  return (
    <NormalContainer>
      <h1 className="font-bold text-xl mb-10">天下快意之事莫若友,快友之事莫若谈</h1>
      <div className="flex justify-between flex-wrap">
        {friendData.map((item, index) => {
          return (
            <FriendCard key={index} {...item} />
          )
        })}
      </div>
    </NormalContainer>
  )
}
