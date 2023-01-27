import type { ActionFunction, LoaderArgs, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import invariant from "tiny-invariant";
import { deleteAccount, updateAccount } from "~/models/account.server";

export const loader: LoaderFunction = async ({ request, params }: LoaderArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  let account = oauth.accounts.find((account) => account.username === params.id )

  return json({ oauthCredential: oauth, account: account });
}

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  
  let account = oauth.accounts.find((account) => account.username === params.id )
  invariant(account, "account not found");
  
  // const userId = await requireUserId(request);

  if (request.method === "DELETE") {
      await deleteAccount(account);
      return redirect("/dashboard");
  } else {
  const data = await request.formData();
  // Object.fromEntries(data);
  const username = data.get("username");

  await updateAccount(account, username);
  
  return redirect(`../${account.username}`);  
  }
}


export default function AccountWalletPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.account;
  
  
  return (
    <div className="flex  flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="font-bold">
          <span className="font-light">Account:</span> {account.username}
        </h1>
        
        <Form method="delete">
          <button
            type="submit"
            className="rounded text-xs bg-slate-600 py-1 px-2 hover:bg-red-500 active:bg-red-600"
          >
            Delete
          </button>
        </Form>
      </header>

      <main className=" h-full ">                      
        <div className="p-6 bg-slate-700 bg-opacity-50 rounded-lg shadow">
          <Form method="post">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Username/handle
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-slate-800 bg-slate-800 px-3 text-gray-400 sm:text-sm">
                http://hiro.cash/
              </span>
              <input
                type="text"
                name="username"
                id="username"
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md bg-slate-800  border-slate-800 focus:border-slate-800 focus:ring-slate-800 sm:text-sm"              
                placeholder="username"
                defaultValue={account.username}
              />              
            </div>
            <div className="mt-4 pt-4 text-right border-t border-slate-600">
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </Form>
        </div>      
      </main>
    </div>
  );
}
