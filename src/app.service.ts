import { Injectable } from '@nestjs/common';
import { ActionGetResponse, ActionPostResponse } from '@solana/actions';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, ParsedAccountData, PublicKey, Transaction } from '@solana/web3.js';

@Injectable()
export class AppService {

  async getReq(req: Request) {
    const amount = 200
    const res: ActionGetResponse = {
      icon: "https://kingsleyheath.co.za/cdn/shop/files/4d82469ec324744758d386c93cc63bb0_2000x.jpg?v=1693312836",
      title: "Blinks Shop",
      description: "Nice Clothes",
      label: "Buy",
      links: {
        actions: [
          {
            href: `${req.url}?amount=${amount}`,
            label: "Buy",
            parameters: [
              {
                name: "address",
                label: "No. 1 Blinks Rd."
              },
              {
                name: "phoneNumber",
                label: "08456529922"
              },
              {
                name: "quantity",
                label: "1-10"
              },
            ]
          }
        ]
      }
    }
    return res
  }

  async postReq(amount: number, req: any) {

    const pubKey = req.body.account
    console.log(pubKey)
    const data = req.body.data
    console.log(data)
    const serialTx = await this.tx((amount * data.quantity), pubKey)
    const res: ActionPostResponse = {
      transaction: serialTx,
      message: "Thank You !!"
    }

    return res
  }

  async tx(amount: number, pubKey: string) {
    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a6164db1-6978-4a22-9e2d-b63cb67b226e');
    const user = new PublicKey(pubKey);
    const mint = '3yGZMxqt6kLUSHhZEbTgnTnvGxn2BhH3aqs7aiac2tF2';

    const merchant_wallet = new PublicKey('ChiTDkUqjYnmgtDYDWvSYQ9dwJgfRAZ3nvFRDRD2KYtR');
    const mint_address = new PublicKey(mint);
    const transfer_amount = amount;

    // get ATAs 
    const sourceAccountAta = await getAssociatedTokenAddress(mint_address, user);
    const merchantAccountAta = await getAssociatedTokenAddress(mint_address, merchant_wallet);

    // Check if the ATAs already exist
    const sourceAccount = await connection.getAccountInfo(sourceAccountAta);
    const merchantAccount = await connection.getAccountInfo(merchantAccountAta);

    const tx = new Transaction();
    if (!sourceAccount) {
      tx.add(createAssociatedTokenAccountInstruction(
        user,
        sourceAccountAta,
        user,
        mint_address
      ));
    }

    if (!merchantAccount) {
      tx.add(createAssociatedTokenAccountInstruction(
        user,
        merchantAccountAta,
        merchant_wallet,
        mint_address
      ));
    }

    const checkDecimals = await connection.getParsedAccountInfo(new PublicKey(mint));
    const numberDecimals = (checkDecimals.value.data as ParsedAccountData).parsed.info.decimals as number

    // console.log(`Number of Decimals: ${numberDecimals}`);

    const adjustedAmount = Math.floor(transfer_amount * Math.pow(10, numberDecimals));
    // console.log(adjustedAmount)
    tx.add(createTransferInstruction(
      sourceAccountAta,
      merchantAccountAta,
      user,
      adjustedAmount
    ));

    tx.recentBlockhash = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;

    tx.feePayer = user;

    const serialTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");

    return serialTx

  }
}
